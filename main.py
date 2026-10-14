def checkPalindrome(word):
    if (word == word[::-1]):
        return True
    else:
        return False

userInput = input("Enter word: ")
if (checkPalindrome(userInput)):
    print(f"{userInput} is a palindrome!")
else:
    print(f"{userInput} is not a palindrome!")
