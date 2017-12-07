import { Customer } from "../models/customer.entity";

export class CustomerTestBuilder{

  private customer: Customer = new Customer();

  public static newCustomer() {
    return new CustomerTestBuilder();
  }

  public withId(id: number): CustomerTestBuilder {
    this.customer.id = id;
    return this;
  }
  public withFirstName(firstname: string): CustomerTestBuilder {
    this.customer.firstName = firstname;
    return this;
  }
  public withLastName(lastName: string): CustomerTestBuilder {
    this.customer.lastName = lastName;
    return this;
  }
  public withPhone(phone: string): CustomerTestBuilder {
    this.customer.phone = phone;
    return this;
  }
  public withEmail(email: string): CustomerTestBuilder {
    this.customer.email = email;
    return this;
  }

  public withDefaultValues(): CustomerTestBuilder{
    return this
      .withFirstName('Joe')
      .withLastName('Doe')
      .withPhone('202-456-1414')
      .withEmail('joe.doe@test.dev')
  }

  public build(): Customer{
    return this.customer;
  }

  public static generateListOfDefaultCustomers(length: number) {
    const result = [];
    let i = 0;
    while (i++ < length) {
      result.push(CustomerTestBuilder.newCustomer().withDefaultValues().withId(Math.random() * 100).build())
    }
    return result;
  }
}
