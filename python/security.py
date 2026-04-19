import json
import sys

try:
    from cryptography.fernet import Fernet
except ImportError:
    print("Error: Missing dependency 'cryptography'.")
    print("Install it with: python -m pip install cryptography")
    sys.exit(1)

# IMPORTANT: Generate key once and save it.
# Uncomment the two lines below, run the script once, copy the output key,
# then comment them again and replace the placeholder key.
# key = Fernet.generate_key()
# print(key)

key = b'your_generated_key_here'
cipher = Fernet(key)

def load_data():
    try:
        with open("passwords.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        print("Error: Corrupted password file.")
        return {}

def save_data(data):
    with open("passwords.json", "w") as f:
        json.dump(data, f)

def add_password():
    site = input("Enter site: ")
    username = input("Enter username: ")
    password = input("Enter password: ")

    encrypted = cipher.encrypt(password.encode()).decode()

    data = load_data()
    data[site] = {"username": username, "password": encrypted}
    save_data(data)

    print("Saved securely!\n")

def get_password():
    site = input("Enter site: ")
    data = load_data()

    if site in data:
        decrypted = cipher.decrypt(data[site]["password"].encode()).decode()
        print("Username:", data[site]["username"])
        print("Password:", decrypted, "\n")
    else:
        print("No record found.\n")

if __name__ == "__main__":
    if key == b'your_generated_key_here':
        print("⚠️  WARNING: Using placeholder key!")
        print("Generate a real key first:\n")
        print("  1. Uncomment lines 6-8")
        print("  2. Run the script once")
        print("  3. Copy the key output")
        print("  4. Replace 'your_generated_key_here' with it\n")

    while True:
        print("\n=== Password Manager ===")
        print("1. Add Password")
        print("2. Get Password")
        print("3. Exit")
        choice = input("\nChoice: ").strip()

        if choice == '1':
            add_password()
        elif choice == '2':
            get_password()
        elif choice == '3':
            print("\nGoodbye! 👋")
            break
        else:
            print("Invalid choice. Try again.")