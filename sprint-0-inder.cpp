#include <iostream>

// Converts a temperature from Celsius to Fahrenheit.
double celsiusToFahrenheit(double c) {
    return c * 9.0 / 5.0 + 32.0;
}

int main() {
    double celsius;
    std::cout << "Enter temperature in Celsius: ";
    std::cin >> celsius;
    // Input validation: reject anything that is not a number
    // and anything below absolute zero (-273.15 C).
    if (!(std::cin >> celsius)) {
        std::cout << "Error: please enter a valid number.\n";
        return 1;
    }
    if (celsius < -273.15) {
        std::cout << "Error: temperature cannot be below -273.15 C.\n";
        return 1;
    }
    std::cout << celsius << " C = " << celsiusToFahrenheit(celsius) << " F\n";
    return 0;
}