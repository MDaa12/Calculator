# Calculator

A small browser-based calculator written with ASP.NET Core and vanilla JavaScript.

## Run

```bash
dotnet run
```

Then open <http://localhost:5000> in a browser. The calculator supports keyboard
input, parentheses, decimals, powers, modulo, percentages, constants, factorials,
reciprocals, square roots, squares, trigonometry in degrees, and `log`/`ln`.

## GitHub Pages

The browser version is static and is deployed automatically by
`.github/workflows/pages.yml` whenever `main` changes. In the repository's
GitHub settings, set **Pages > Build and deployment > Source** to **GitHub
Actions**. The deployed site will then be available at the repository's Pages
URL.