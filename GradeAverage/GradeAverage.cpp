#include <iostream>

int main()
{
    double mark1 = 0.0;
    double mark2 = 0.0;
    double mark3 = 0.0;

    std::cout << "Enter three marks: ";
    std::cin >> mark1 >> mark2 >> mark3;

    double average = (mark1 + mark2 + mark3) / 3.0;

    std::cout << "Average: " << average << std::endl;
    return 0;
}