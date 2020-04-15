class Customer {
    constructor(id) {
      this.data = {
        id,
        name: null,
        phoneNo: null
      };
    }
  
    get id() {
      return this.data.id;
    }
  
    get name() {
      return this.data.name;
    }
  
    set name(value) {
      this.data.name = value;
    }
  
    get phoneNo() {
      return this.data.phoneNo;
    }
  
    set phoneNo(value) {
      this.data.phoneNo = value;
    }
  
    toJson() {
      return this.data;
    }
  }
  
  module.exports = Customer;
  