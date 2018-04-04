// Transaction associated with the driving history block
class Transaction {
  constructor(driverLicenseNumber, voilationDate, voilationType) {
    this.driverLicenseNumber = driverLicenseNumber;
    this.voilationDate = voilationDate;
    this.voilationType = voilationType;
    this.noOfVoilations = 1;
    this.isDriverLicenseSuspended = false;
  }
}

module.exports = Transaction;
