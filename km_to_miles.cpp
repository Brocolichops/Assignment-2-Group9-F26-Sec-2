/ Sprint-0 practice: Convert kilometres to miles
// User story: As a driver, I want to enter a distance in kilometres
// and see it in miles. Invalid input shows an error and asks again.
 
#include <iostream>
#include <iomanip>
#include <limits>
using namespace std;
 
const double MILES_PER_KM = 0.621371;
 
// Converts a distance in kilometres to miles
double kmToMiles(double km) {
    return km * MILES_PER_KM;
}
 
// Asks until the user enters a number that is 0 or more.
// Returns false if the input ends before a valid number is given.
bool getKilometres(double& km) {
    while (true) {
        cout << "Enter distance in kilometres: ";
        cin >> km;
 
        if (cin.eof()) {
            return false;
        }
 
        if (cin.fail()) {   // not a number, like "abc"
            cout << "Error: please enter a number, for example 10 or 12.5." << endl;
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        } else if (km < 0) {
            cout << "Error: distance cannot be negative." << endl;
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        } else {
            return true;
        }
    }
}
 
int main() {
    double km;
 
    if (!getKilometres(km)) {
        return 1;
    }
 
    cout << fixed << setprecision(2);   // show two decimal places
    cout << km << " km = " << kmToMiles(km) << " miles" << endl;
 
    return 0;
}
