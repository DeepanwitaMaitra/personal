class Card:
    def __init__(self, suit, rank):
        self.suit = suit
        self.rank = rank

class Deck:
    def __init__(self):
        self.cards = []
        suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']
        self.cards = [Card(s, r) for s in suits for r in ranks] #creates a list of Card objects for each combination of suit and rank
    def shuffle(self):
        import random
        random.shuffle(self.cards) #shuffles the list of cards using the random module
    def deal(self, players, n):
        for _ in range(n):
            for p in players:
                p.hand.append(self.cards.pop()) #deals n cards to each player by popping cards from the deck and appending them to the player's hand
class Player:
    def __init__(self, name):
        self.name = name
        self.hand = [] #initializes an empty list to hold the player's cards
p1 = Player("abc")
p2 = Player("bcd")
deck = Deck() #creates a new deck of cards
deck.shuffle() #shuffles the deck
deck.deal([p1,p2], 5)#deals 5 cards to each player
print(p1.hand, p2.hand) #prints the hands of both players  