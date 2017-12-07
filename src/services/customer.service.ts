import { getManager, Repository } from 'typeorm';
import { Inject, Singleton } from 'typescript-ioc';
import { Customer } from '../models/customer.entity';

@Singleton
export  class CustomerService {
  constructor() { }
  
  private getCustomerRepository(): Repository<Customer> {
    return getManager().getRepository(Customer);
  }

  public async getAllCustomers(): Promise<Customer[]> {
    return this.getCustomerRepository().find();
  }

 

  public async findCustomerById(id: number): Promise<Customer>{
    const result = await this.getCustomerRepository().findOneById(id);
    if (!result) {
      throw new Error(`No customer was found for ID ${id}`);
    }
    return result;
  }

  public async saveCustomer(customer: Customer): Promise<Customer> {
    return this.getCustomerRepository().save(customer);
  }

  public async updateCustomer(customer: Customer): Promise<Customer | undefined> {
    await this.getCustomerRepository().updateById(customer.id, customer);
    return this.getCustomerRepository().findOneById(customer.id); 
  }
  
  public async deleteCustomer(id: number) {
    return this.getCustomerRepository().deleteById(id);
  }

}
