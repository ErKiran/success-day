import type { SamlSsoConfiguration } from "@prisma/client";
import { SAML, ValidateInResponseTo, type Profile } from "@node-saml/node-saml";

export function samlServiceProviderUrls(baseUrl: string, configurationId: string) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    entityId: `${cleanBaseUrl}/api/saml/${configurationId}/metadata`,
    acsUrl: `${cleanBaseUrl}/api/saml/${configurationId}/acs`
  };
}

function normalizeCertificate(certificate: string) {
  return certificate.replace(/\\n/g, "\n").trim();
}

export function createSamlServiceProvider(configuration: SamlSsoConfiguration, baseUrl: string) {
  const { entityId, acsUrl } = samlServiceProviderUrls(baseUrl, configuration.id);
  const issuer = configuration.spEntityId?.trim() || entityId;

  return new SAML({
    callbackUrl: acsUrl,
    issuer,
    audience: issuer,
    entryPoint: configuration.idpSsoUrl,
    idpCert: normalizeCertificate(configuration.certificate),
    idpIssuer: configuration.idpEntityId,
    acceptedClockSkewMs: 120000,
    identifierFormat: configuration.nameIdFormat,
    disableRequestedAuthnContext: true,
    validateInResponseTo: ValidateInResponseTo.ifPresent,
    wantAssertionsSigned: false,
    wantAuthnResponseSigned: false,
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256"
  });
}

function toArray(value: unknown) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function parseRoleList(value: unknown) {
  return toArray(value)
    .flatMap((entry) => String(entry || "").split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getProfileValue(profile: Profile, key: string, fallback = "") {
  const raw = profile[key];

  if (raw === undefined || raw === null) {
    return fallback;
  }

  if (Array.isArray(raw)) {
    return String(raw[0] ?? fallback);
  }

  return String(raw);
}

export function buildUserFromSamlProfile(profile: Profile, configuration: SamlSsoConfiguration) {
  const email = getProfileValue(profile, configuration.mapEmailClaim) || getProfileValue(profile, "email") || getProfileValue(profile, "mail");
  const firstName = getProfileValue(profile, configuration.mapFirstNameClaim) || getProfileValue(profile, "givenName");
  const lastName = getProfileValue(profile, configuration.mapLastNameClaim) || getProfileValue(profile, "sn");
  const roles = [
    ...parseRoleList(profile.roles),
    ...parseRoleList(profile.role),
    ...parseRoleList(profile.groups),
    ...parseRoleList(profile.memberOf)
  ];

  return {
    username: profile.nameID || email || "saml-user",
    name: [firstName, lastName].filter(Boolean).join(" ") || null,
    email: email || null,
    roles: Array.from(new Set(roles)),
    authMethod: "saml"
  };
}
