# mCRL2-formatter

This repository contains a node package for converting [mCRL2](https://www.mcrl2.org/web/user_manual/index.html) [mu calculus formulas](https://www.mcrl2.org/web/user_manual/language_reference/mucalc.html?highlight=calculus) to equivalent formulas in latex form.

I initially intended to also create a formatter/pretty printer, but this turned out to generally be a more complex problem than anticipated. Doing this right would require a lot of time, which I didn't want to invest into it. So for now only plain text to latex conversion is included.

The most important parts of the code are:

-   The parser: [muCalculusParser](https://github.com/TarVK/mCRL2-formatter/blob/main/src/parser/muCalculusParser.ts)
-   The CST to latex converter: [nodeToLatex](https://github.com/TarVK/mCRL2-formatter/blob/main/src/formatting/nodeToLatex.ts)

## Website

This repository also contains a demo website from which the tool can be used without installing anything. This page can be found at: [tarvk.github.io/mCRL2-formatter/demo/build/](https://tarvk.github.io/mCRL2-formatter/demo/build/)

![Screenshot](./screenshot.png)

## Contributing

Not all parts of the code have been tested extensively, and I don't know the best practices for latex formatting, so any bug reports or PRs are welcome.

### Building the formatter

This project requires npm and node.js to be installed.

Then to install all dependencies required for the formatter, from the root directory run:

```
npm install
```

Then you can either build once using:

```
npm run build
```

Or continuously build (which updates as soon as the code changes) using:

```
npm run dev
```

Note that building is rather slow, since I tried some meta programming in this project, such that node types are automatically inferred. But it does seem like this slows TS down significantly, so this was probably a bad idea.

### Building the website

You will need npm and node.js, as well as having build the formatter.

Then to install all dependencies for the site, from the `demo` directory run:

```
npm install
```

Then you can either build once for production using:

```
npm run build
```

Or continuously build the site - and have it hosted on localhost:3000 while auto refreshing the page on changes - using:

```
npm run start
```
