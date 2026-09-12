using System.Globalization;

Console.WriteLine("Calculator");
Console.WriteLine("Enter an expression such as 12.5 * 4, or q to quit.");

while (true)
{
    Console.Write("> ");
    var input = Console.ReadLine()?.Trim();

    if (string.IsNullOrEmpty(input))
    {
        continue;
    }

    if (input.Equals("q", StringComparison.OrdinalIgnoreCase) ||
        input.Equals("quit", StringComparison.OrdinalIgnoreCase))
    {
        break;
    }

    var parts = input.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (parts.Length != 3 ||
        !decimal.TryParse(parts[0], NumberStyles.Number, CultureInfo.InvariantCulture, out var left) ||
        !decimal.TryParse(parts[2], NumberStyles.Number, CultureInfo.InvariantCulture, out var right))
    {
        Console.WriteLine("Use the format: number operator number");
        continue;
    }

    decimal result;
    switch (parts[1])
    {
        case "+":
            result = left + right;
            break;
        case "-":
            result = left - right;
            break;
        case "*":
            result = left * right;
            break;
        case "/" when right != 0:
            result = left / right;
            break;
        case "/":
            Console.WriteLine("Cannot divide by zero.");
            continue;
        default:
            Console.WriteLine("Supported operators: +, -, *, /");
            continue;
    }

    Console.WriteLine(result.ToString(CultureInfo.InvariantCulture));
}