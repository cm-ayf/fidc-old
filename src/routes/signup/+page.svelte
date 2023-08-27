<script lang="ts">
  import Button from "@smui/button";
  import Paper from "@smui/paper";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import {
    create,
    parseCreationOptionsFromJSON,
  } from "@github/webauthn-json/browser-ponyfill";
  import type { AttestationOptionsRequest } from "../attestation/options/+server";

  let email = "";
  let name = "";

  async function signup() {
    const optionsResponse = await fetch("/attestation/options", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        displayName: name,
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: true,
          residentKey: "preferred",
          userVerification: "preferred",
        },
        attestation: "direct",
      } satisfies AttestationOptionsRequest),
    });

    const optionsJson = await optionsResponse.json();
    const credential = await create(parseCreationOptionsFromJSON(optionsJson));

    const _resultResponse = await fetch("/attestation/result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credential),
    });
  }
</script>

<Paper style="text-align: center; max-width: 320px; margin: auto;">
  <Textfield type="email" bind:value={email} label="Email" style="width: auto;">
    <HelperText validationMsg slot="helper">
      Please enter a valid email address.
    </HelperText>
  </Textfield>
  <Textfield type="text" bind:value={name} label="Name" style="width: auto;">
    <HelperText validationMsg slot="helper">Please enter your name.</HelperText>
  </Textfield>
  <Button variant="raised" on:click={signup}>Sign Up</Button>
</Paper>
