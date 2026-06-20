ALTER TABLE "SamlSsoConfiguration" ADD COLUMN "spEntityId" TEXT;
ALTER TABLE "SamlSsoConfiguration" ADD COLUMN "nameIdFormat" TEXT NOT NULL DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';
ALTER TABLE "SamlSsoConfiguration" ADD COLUMN "mapEmailClaim" TEXT NOT NULL DEFAULT 'email';
ALTER TABLE "SamlSsoConfiguration" ADD COLUMN "mapFirstNameClaim" TEXT NOT NULL DEFAULT 'givenName';
ALTER TABLE "SamlSsoConfiguration" ADD COLUMN "mapLastNameClaim" TEXT NOT NULL DEFAULT 'sn';
