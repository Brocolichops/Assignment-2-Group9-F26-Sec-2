// Sprint-0 practice: Convert kilometres to miles
// User story: As a driver, I want to enter a distance in kilometres
// and see it in miles.

#include <iostream>
#include <iomanip>
using namespace std;

const double MILES_PER_KM = 0.621371;

// Converts a distance in kilometres to miles
double kmToMiles(double km) {
    return km * MILES_PER_KM;
}

int main() {
    double km;

    cout << "Enter distance in kilometres: ";
    cin >> km;

    cout << fixed << setprecision(2);   // show two decimal places
    cout << km << " km = " << kmToMiles(km) << " miles" << endl;

    return 0;
}
