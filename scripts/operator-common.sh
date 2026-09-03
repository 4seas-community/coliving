#!/usr/bin/env bash

readonly FOURSEAS_HOST="149.28.158.244"
readonly FOURSEAS_GITEA_PORT="222"
readonly FOURSEAS_GITEA_ED25519="SHA256:b491ZKm25t2ocFiMigABX8pS5qzMb8y0D8h4gI4/UZg"
readonly FOURSEAS_GITEA_URL="ssh://git@${FOURSEAS_HOST}:${FOURSEAS_GITEA_PORT}/4Seas/coliving.git"

operator_key="${FOURSEAS_SSH_KEY:-${HOME}/.ssh/id_rsa}"
operator_expected_key="${FOURSEAS_EXPECTED_USER_KEY_FINGERPRINT:-}"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

prepare_gitea_access() {
  [[ -n "${operator_expected_key}" ]] || fail \
    "set FOURSEAS_EXPECTED_USER_KEY_FINGERPRINT to your public-key fingerprint"
  [[ -r "${operator_key}" && -r "${operator_key}.pub" ]] || fail \
    "SSH key or public key is not readable: ${operator_key}"
  [[ "${operator_key}" != *[[:space:]]* ]] || fail "SSH key path must not contain whitespace"

  local actual lookup known fingerprints
  actual="$(ssh-keygen -lf "${operator_key}.pub" 2>/dev/null | awk '{print $2}')"
  [[ "${actual}" == "${operator_expected_key}" ]] || fail \
    "SSH key fingerprint does not match FOURSEAS_EXPECTED_USER_KEY_FINGERPRINT"

  lookup="[${FOURSEAS_HOST}]:${FOURSEAS_GITEA_PORT}"
  known="$(ssh-keygen -F "${lookup}" 2>/dev/null | awk '!/^#/ {print}')"
  [[ -n "${known}" ]] || fail \
    "${lookup} is absent from known_hosts; verify its host key with a 4Seas administrator"
  fingerprints="$(printf '%s\n' "${known}" | ssh-keygen -lf - 2>/dev/null | awk '{print $2}')"
  grep -Fqx "${FOURSEAS_GITEA_ED25519}" <<<"${fingerprints}" || fail \
    "the verified ED25519 Gitea host-key fingerprint is absent"
}

gitea_git() {
  local ssh_command
  ssh_command="/usr/bin/ssh -p ${FOURSEAS_GITEA_PORT} -o BatchMode=yes"
  ssh_command+=" -o IdentitiesOnly=yes -o IdentityFile=${operator_key}"
  ssh_command+=" -o StrictHostKeyChecking=yes -o HostKeyAlgorithms=ssh-ed25519"
  ssh_command+=" -o ConnectTimeout=10"
  git -c "core.sshCommand=${ssh_command}" "$@"
}
