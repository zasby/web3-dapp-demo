## ADDED Requirements

### Requirement: Network fee estimate in the Send form
The Send form SHALL show the expected network fee in the native currency before the user signs.

#### Scenario: Valid transfer
- **WHEN** the recipient and the amount are valid and gas and fees are estimated
- **THEN** the form shows "Network fee ≈ <fee> <native symbol>", where fee = gas × maxFeePerGas

#### Scenario: Chain without EIP-1559
- **WHEN** the chain returns only a legacy gas price
- **THEN** the fee is gas × gasPrice

#### Scenario: Estimate unavailable
- **WHEN** gas or fee estimation fails or the form is incomplete
- **THEN** no fee line is shown and sending is not blocked by the estimate
