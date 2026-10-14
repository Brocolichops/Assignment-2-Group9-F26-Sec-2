#include <iostream>

// Converts a temperature from Celsius to Fahrenheit.
double celsiusToFahrenheit(double c) {
    return c * 9.0 / 5.0 + 32.0;
}

int main() {
    double celsius;
    std::cout << "Enter temperature in Celsius: ";
    std::cin >> celsius;
    std::cout << celsius << " C = " << celsiusToFahrenheit(celsius) << " F\n";
    return 0;
}