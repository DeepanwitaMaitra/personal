class BankAccount:
    def __init__(self,acc_name,acc_number,balance):
        self.acc_name=acc_name
        self.acc_number=acc_number
        self.balance=balance


    def deposit(self,amount):
        self.balance+=amount

    def withdraw(self,amount):
        if amount>self.balance:
            print("Insufficient balance")
        else:
            self.balance-=amount
    def display(self):
        print(self.balance, self.acc_name, self.acc_number)