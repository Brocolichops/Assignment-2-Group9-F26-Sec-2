#include <iostream>

char getLetterGrade(double average)
{
    if (average >= 80.0) return 'A';
    if (average >= 70.0) return 'B';
    if (average >= 60.0) return 'C';
    if (average >= 50.0) return 'D';
    return 'F';
}

bool isValidMark(double mark)
{
    return mark >= 0.0 && mark <= 100.0;
}

int main()
{
    double mark1 = 0.0;
    double mark2 = 0.0;
    double mark3 = 0.0;

    std::cout << "Enter three marks (0 to 100): ";

    if (!(std::cin >> mark1 >> mark2 >> mark3))
    {
        std::cout << "Invalid input. Please enter numbers only." << std::endl;
        return 1;
    }

    if (!isValidMark(mark1) || !isValidMark(mark2) || !isValidMark(mark3))
    {
        std::cout << "Each mark must be between 0 and 100." << std::endl;
        return 1;
    }

    double average = (mark1 + mark2 + mark3) / 3.0;

    std::cout << "Average: " << average << std::endl;
    std::cout << "Letter grade: " << getLetterGrade(average) << std::endl;
    return 0;
}