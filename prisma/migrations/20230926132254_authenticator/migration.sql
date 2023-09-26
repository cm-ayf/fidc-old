-- CreateTable
CREATE TABLE "Authenticator" (
    "id" BLOB NOT NULL PRIMARY KEY,
    "sub" TEXT NOT NULL,
    "public_key" BLOB NOT NULL,
    CONSTRAINT "Authenticator_sub_fkey" FOREIGN KEY ("sub") REFERENCES "User" ("sub") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Authenticator_sub_idx" ON "Authenticator"("sub");
