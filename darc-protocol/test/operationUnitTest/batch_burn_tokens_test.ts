import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

// test for batch mint token instruction on DARC
function containsAddr(array: string[], addr:string): boolean {
  for (let i = 0; i < array.length; i++) {
    if (array[i].toLowerCase() === addr.toLowerCase()) {
      return true;
    }
  }
  return false;
}


describe("batch_burn_tokens_test", function () {

  
  it ("should burn tokens", async function () {

    const DARC = await ethers.getContractFactory("DARC");
    const darc = await DARC.deploy();
    console.log("DARC address: ", darc.address);
    await darc.deployed();
    await darc.initialize();


    const programOperatorAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";


    // create a token class first
    await darc.entrance({
      notes: "create token class",
      programOperatorAddress: programOperatorAddress,
      operations: [{
        operatorAddress: programOperatorAddress,
        opcode: 2, // create token class
        param: {
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: ["Class1", "Class2"],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0), BigNumber.from(1)],
            [BigNumber.from(10), BigNumber.from(1)],
            [BigNumber.from(10), BigNumber.from(1)],
          ],
          ADDRESS_2DARRAY: [],
          BYTES: []
        }
      }], 
    });


    // mint tokens
    await darc.entrance({
      notes: "mint tokens and burn some tokens",
      programOperatorAddress: programOperatorAddress,
      operations: [{
        operatorAddress: programOperatorAddress,
        opcode: 1, // mint token
        param: {
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: [],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0), BigNumber.from(1)],  // token class = 0
            [BigNumber.from(100), BigNumber.from(200)], // amount = 100
          ],
          ADDRESS_2DARRAY: [
            [programOperatorAddress,programOperatorAddress], // to = target 1
          ],
          BYTES: []
        }
      },
      {
        operatorAddress: programOperatorAddress,
        opcode: 5, // burn tokens
        param:{
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: [],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0),BigNumber.from(1)],  // token class = 0, 1
            [BigNumber.from(10), BigNumber.from(40)], // amount = 10, 40
          ],
          ADDRESS_2DARRAY: [],
          BYTES: []
        }
      }], 
    });

    // check balance of programOperatorAddress:
    // class 0 = 100 -10 = 90
    // class 1 = 200 - 40 = 160
    expect ((await darc.getTokenOwnerBalance(0, programOperatorAddress)).toBigInt().toString()).to.equal("90");
    expect ((await darc.getTokenOwnerBalance(1, programOperatorAddress)).toBigInt().toString()).to.equal("160"); 

    expect (containsAddr(await darc.getTokenOwners(0), programOperatorAddress)).to.equal(true);
    expect (containsAddr(await darc.getTokenOwners(1), programOperatorAddress)).to.equal(true);

    // burn remaining tokens and check balance
    // mint tokens
    await darc.entrance({
      notes: "burn remaining tokens",
      programOperatorAddress: programOperatorAddress,
      operations: [
      {
        operatorAddress: programOperatorAddress,
        opcode: 5, // burn tokens
        param:{
          UINT256_ARRAY: [],
          ADDRESS_ARRAY: [],
          STRING_ARRAY: [],
          BOOL_ARRAY: [],
          VOTING_RULE_ARRAY: [],
          PARAMETER_ARRAY: [],
          PLUGIN_ARRAY: [],
          UINT256_2DARRAY: [
            [BigNumber.from(0),BigNumber.from(1)],  // token class = 0, 1
            [BigNumber.from(90), BigNumber.from(160)], // amount = 10, 40
          ],
          ADDRESS_2DARRAY: [],
          BYTES: []
        }
      }], 
    });

    expect ((await darc.getTokenOwnerBalance(0, programOperatorAddress)).toBigInt().toString()).to.equal("0");
    expect ((await darc.getTokenOwnerBalance(1, programOperatorAddress)).toBigInt().toString()).to.equal("0");
    expect (containsAddr(await darc.getTokenOwners(0), programOperatorAddress)).to.equal(false);
    expect (containsAddr(await darc.getTokenOwners(1), programOperatorAddress)).to.equal(false);

    // make sure that 
  });
});