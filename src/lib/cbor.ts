export function decode(buffer: ArrayBuffer | ArrayBufferView) {
  return new Decoder(
    buffer instanceof ArrayBuffer ? buffer : buffer.buffer
  ).next();
}

export function* decodeAll(buffer: ArrayBuffer | ArrayBufferView) {
  const decoder = new Decoder(
    buffer instanceof ArrayBuffer ? buffer : buffer.buffer
  );
  let next;
  while ((next = decoder.next()) !== RETURN) yield next;
}

class Decoder extends DataView {
  position = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next(): any {
    if (this.position >= this.byteLength) return RETURN;
    const { major, argument, the31, value } = this.head();
    switch (major) {
      case MajorType.PositiveInt: {
        if (argument === undefined)
          throw new Error("argument is required on Positive Int");
        return argument;
      }
      case MajorType.NegativeInt: {
        if (argument === undefined)
          throw new Error("argument is required on Negative Int");
        return -1 - argument;
      }
      case MajorType.ByteString: {
        if (the31) {
          return this.indefiniteByte();
        } else {
          if (argument === undefined)
            throw new Error(
              "argument is required on definite-length Byte String"
            );
          return this.bytes(argument);
        }
      }
      case MajorType.TextString: {
        if (the31) {
          return this.indefiniteText();
        } else {
          if (argument === undefined)
            throw new Error(
              "argument is required on definite-length Text String"
            );
          return new TextDecoder().decode(this.bytes(argument));
        }
      }
      case MajorType.Array: {
        const array = [];
        if (the31) {
          let next;
          while ((next = this.next()) !== BREAK) array.push(next);
        } else {
          if (argument === undefined)
            throw new Error("argument is required on definite-length Array");
          for (let i = 0; i < argument; i++) array.push(this.next());
        }
        return array;
      }
      case MajorType.Map: {
        const map: Record<string, unknown> = {};
        if (the31) {
          let next;
          while ((next = this.next()) !== BREAK) map[next] = this.next();
        } else {
          if (argument === undefined)
            throw new Error("argument is required on definite-length Map");
          for (let i = 0; i < argument; i++) {
            const key = this.next();
            const value = this.next();
            map[key] = value;
          }
        }
        return map;
      }
      case MajorType.Tag: {
        return this.next();
      }
      case MajorType.Simple: {
        switch (value) {
          case 20:
            return false;
          case 21:
            return true;
          case 22:
            return null;
          case 23:
            return undefined;
          case BREAK:
            return BREAK;
          default:
            throw new Error(`Unknown simple value: ${value}`);
        }
      }
    }
  }

  head(): Head {
    const byte = this.getUint8(this.position++);
    const major = byte >> 5;
    const additional = byte & 0b11111;
    if (major === MajorType.Simple) {
      if (additional < 24) return { major, value: additional };

      switch (additional) {
        case 24: {
          const value = this.getUint8(this.position++);
          return { major, value };
        }
        case 25: {
          throw new Error("Unsupported type: Float16");
        }
        case 26: {
          const value = this.getFloat32(this.position);
          this.position += 4;
          return { major, value };
        }
        case 27: {
          const value = this.getFloat64(this.position);
          this.position += 8;
          return { major, value };
        }
        case 31: {
          return { major, value: BREAK };
        }
      }
    } else {
      if (additional < 24) return { major, argument: additional };

      switch (additional) {
        case 24: {
          const argument = this.getUint8(this.position);
          this.position += 1;
          return { major, argument };
        }
        case 25: {
          const argument = this.getUint16(this.position);
          this.position += 2;
          return { major, argument };
        }
        case 26: {
          const argument = this.getUint32(this.position);
          this.position += 4;
          return { major, argument };
        }
        case 27: {
          const argument = Number(this.getBigUint64(this.position));
          this.position += 8;
          return { major, argument };
        }
        case 31: {
          return { major, the31: true };
        }
      }
    }

    throw new Error(`Unsupported additional info: ${additional}`);
  }

  bytes(length: number) {
    const start = this.position;
    this.position += length;
    return this.buffer.slice(start, this.position);
  }

  indefiniteByte() {
    let head: Head;
    let view = new Uint8Array(64);
    let offset = 0;

    while ((head = this.head()).value !== BREAK) {
      if (head.major !== MajorType.ByteString)
        throw new Error(`Expected ByteString, got ${head.major}`);
      if (head.argument === undefined)
        throw new Error("argument is required on definite-length Byte String");

      const chunk = this.bytes(head.argument);
      if (offset + chunk.byteLength > view.byteLength) {
        const newBuffer = new Uint8Array(view.byteLength * 2);
        newBuffer.set(view);
        view = newBuffer;
      }
      view.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    return view.buffer.slice(0, offset);
  }

  indefiniteText() {
    let head: Head;
    let buffer = "";
    const decoder = new TextDecoder();

    while ((head = this.head()).value !== BREAK) {
      if (head.major !== MajorType.TextString)
        throw new Error(`Expected TextString, got ${head.major}`);
      if (head.argument === undefined)
        throw new Error("argument is required on definite-length Text String");

      const chunk = this.bytes(head.argument);
      buffer += decoder.decode(chunk);
    }

    return buffer;
  }
}

const BREAK = Symbol("BREAK");
const RETURN = Symbol("RETURN");

enum MajorType {
  PositiveInt = 0,
  NegativeInt = 1,
  ByteString = 2,
  TextString = 3,
  Array = 4,
  Map = 5,
  Tag = 6,
  Simple = 7,
}

interface Head {
  major: MajorType;
  argument?: number;
  the31?: boolean;
  value?: number | typeof BREAK;
}
