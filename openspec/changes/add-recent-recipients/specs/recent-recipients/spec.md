## ADDED Requirements

### Requirement: Remember recent recipients
The app SHALL remember up to 5 most recent recipients of confirmed transfers, per chain.

#### Scenario: Confirmed transfer
- **WHEN** a transfer to an address is confirmed
- **THEN** the address becomes the first item of that chain's recent recipients list

#### Scenario: Same address again
- **WHEN** the address is already in the list, in any letter case
- **THEN** it moves to the top and is not duplicated

#### Scenario: More than five
- **WHEN** a sixth distinct recipient is added
- **THEN** the oldest one is dropped

### Requirement: Suggest recent recipients
The Send form SHALL offer the current chain's recent recipients as suggestions for the recipient field.

#### Scenario: Picking a suggestion
- **WHEN** the user picks a suggested address
- **THEN** the recipient field is filled with it
