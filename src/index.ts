import {dataExprParser, sortExprParser} from "./muCalculusParser";

const typeTest = sortExprParser.parse("Nat # Nat -> List(Nat # Nat -> Bool) -> List(Bool)");
const dataTest = dataExprParser.parse("(someStuff)[{} -> [45, stuff]](shit, poop) => crap(true)");

// const result = sortExprParser.parse("Nat # Nat -> List(Bool)");
console.log(dataTest);
debugger;
