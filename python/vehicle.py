class Vehicle:
    def __init__(self, make, model):
        self.make = make
        self.model = model

    def display_info(self):
       print(self.make, self.model)
    class Car(Vehicle):
        def __init__(self, make, model, num_doors):
        #super().__init__(make, model) so that we dont rewrite the code from parent class
            self.num_doors = num_doors
    def display_info(self):
        print(self.make, self.model, self.num_doors)
