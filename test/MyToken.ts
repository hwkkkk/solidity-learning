import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("mytoken deploy", () => {
  let MyTokenC: MyToken;
  let signers: HardhatEthersSigner[];
  before("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    MyTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      18,
    ]);
  });

  it("should return name", async () => {
    expect(await MyTokenC.name()).equal("MyToken");
  });

  it("should return symbol", async () => {
    expect(await MyTokenC.symbol()).equal("MT");
  });

  it("should return decimals", async () => {
    expect(await MyTokenC.decimals()).equal(18);
  });

  it("should return 0 totalSupply", async () => {
    expect(await MyTokenC.totalSupply()).equal(0);
  });

  it("shuld return 0 balance for signer 0", async () => {
    const signer0 = signers[0];
    expect(await MyTokenC.balanceOf(signers[0].address)).equal(0);
  });
});
