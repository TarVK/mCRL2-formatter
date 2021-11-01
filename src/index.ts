import {nodeToLatex} from "./formatting/nodeToLatex";
import {dataExprParser, sortExprParser, stateFrmParser} from "./parser/muCalculusParser";

const typeTest = sortExprParser.parse(`\
(Nat # Nat -> 
    List((Nat # Nat -> Bool))) -> List(Bool)\
`);
if (typeTest.status) console.log(nodeToLatex(typeTest.value));

// const dataTest = dataExprParser.parse("(someStuff)[{} -> [45, stuff]](shit, poop) => crap(true)");
// console.log(dataTest);

// const formulaTest1 = stateFrmParser.parse(`\
// [true*]forall s: Sluice.
// exists r_1: Robot. [(exists r_2: Robot. waferToSluice(s, r_2)) . !waferFromSluice(s, r_1)* . (exists r_2: Robot. waferToSluice(s, r_2))] false`);
// console.log(formulaTest1);

// const formulaTest2 = stateFrmParser.parse(`\
// [true*]forall s: Sluice.[waferFromSluice(s, r2)]
// 	(mu B.
// 		[!(exists lp: Nat. val(lp < rackSize) && waferToWaitingRack(r2, lp))]B
// 		&& !<exists lp: Nat, ls: Sluice. val(lp<rackSize) && (
//             waferFromSluice(ls, r2) ||
//             waferToSluice(ls, r2) ||
//             waferFromWaitingRack(r2, lp)
//             )>true
// 		&& forall p: Nat. val(p < rackSize) => [waferToWaitingRack(r2, p)](mu C.
// 			[!waferFromWaitingRack(r3, p)]C
//             && !<waferFromWaitingRack(r2, p)>true
//             && [waferFromWaitingRack(r3, p)](mu D.
//                 [!waferToProjection]D
//                 && !<exists lp: Nat. val(lp<rackSize) && waferToWaitingRack(r3, lp)>true
//                 && [waferToProjection](mu E.
//                     [!projectionDone]E
//                     && !<exists lp: Nat. val(lp<rackSize) && waferToWaitingRack(r3, lp)>true
//                     && [projectionDone]true
//                 )
//             )
// 		)
// 	)`);
// console.log(formulaTest2);

// const formulaTest3 = stateFrmParser.parse(`\
// [!(inputRackReplaced || (exists p: Nat . val(p < rackSize) && waferToOutputRack(p)) || (exists d: Door . doorBroken(d)))]C(i, ib)
// && [inputRackReplaced]C(i + rackSize, ib)
// && [exists p: Nat . val(p < rackSize) && waferToOutputRack(p)]C(i-1, ib)
// && [exists d: Door . doorBroken(d)]C(i, ib+1)
// && (mu X(v: Int=0, vb: Nat=0).
//     (
//         [!(inputRackReplaced || (exists p: Nat . val(p < rackSize) && waferToOutputRack(p)) || (exists d: Door . doorBroken(d)))]X(v, vb)
//         && [exists p: Nat . val(p < rackSize) && waferToOutputRack(p)]X(v-1, vb)
//         && [exists d: Door . doorBroken(d)]X(v, vb+1)
//         && <!inputRackReplaced>true
//     )
//     || val(i+v == 0)
//     || val(ib+vb >= 2)
//     || val(ib+vb == 1 && i+v == 1)
// )`);
// console.log(formulaTest3);

debugger;
