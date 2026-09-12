# Calculator

A small browser-based calculator written with ASP.NET Core and vanilla JavaScript.

## Run

```bash
dotnet run
```

Then open <http://localhost:5000> in a browser. The calculator supports keyboard
input, parentheses, decimals, powers, modulo, percentages, constants, factorials,
reciprocals, square roots, squares, trigonometry in degrees, `log`/`ln`, and
scientific notation such as `6.02e23` or `1.5e-4`.

The **Dice** page at <http://localhost:5000/dice.html> rolls D4, D6, D8, D10,
D12, D20, and D100 dice with multiple dice and modifiers. It also includes
quick D&D rolls, natural 20/1 callouts, and a roll log.

## GitHub Pages

The browser version is static and is deployed automatically by
`.github/workflows/pages.yml` whenever `main` changes. In the repository's
GitHub settings, set **Pages > Build and deployment > Source** to **GitHub
Actions**. The deployed site will then be available at the repository's Pages
URL.