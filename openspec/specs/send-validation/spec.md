# send-validation Specification

## Purpose
Validation rules for the recipient field of the Send form: a valid EVM address that is not the connected wallet.
## Requirements
### Requirement: Recipient must be a valid address
The Send form SHALL accept only a valid EVM address as the recipient.

#### Scenario: Invalid address
- **WHEN** the user enters a string that is not an EVM address
- **THEN** the form shows "Not a valid address" and the Send button is disabled

#### Scenario: Empty field
- **WHEN** the recipient field is empty
- **THEN** no error is shown

### Requirement: No transfers to the connected address
The Send form SHALL NOT allow sending to the address of the connected wallet.

#### Scenario: Own address in any letter case
- **WHEN** the user enters the connected address, in checksum or lowercase form
- **THEN** the form shows "This is your own address" and the Send button is disabled

#### Scenario: Another valid address
- **WHEN** the user enters a valid address different from the connected one
- **THEN** no recipient error is shown

