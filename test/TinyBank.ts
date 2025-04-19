import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let MyTokenC: MyToken;
  let tinyBankC: TinyBank;
  let signers: HardhatEthersSigner[];

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    MyTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);
    tinyBankC = await hre.ethers.deployContract("TinyBank", [
      await MyTokenC.getAddress(),
    ]);
  });

  describe("Initialized state check", () => {
    it("should return totalStaked 0", async () => {
      expect(await tinyBankC.totalstaked()).to.equal(0);
    });

    it("should return staked 0 amount of signer0", async () => {
      const signer0 = signers[0];
      expect(await tinyBankC.staked(signer0.address)).to.equal(0);
    });
  });

  describe("Staking", () => {
    it("should return staked amount", async () => {
      const signer0 = signers[0];
      const stakingamount = hre.ethers.parseUnits("50", DECIMALS);
      await MyTokenC.approve(await tinyBankC.getAddress(), stakingamount);
      await tinyBankC.stake(stakingamount);
      expect(await tinyBankC.staked(signer0.address)).to.equal(stakingamount);
      expect(await MyTokenC.balanceOf(tinyBankC)).to.equal(
        await tinyBankC.totalstaked()
      );
    });
  });

  describe("Withdraw", () => {
    it("should return 0 staked after withdrawing total token", async () => {
      const signer0 = signers[0];
      const stakingamount = hre.ethers.parseUnits("50", DECIMALS);
      await MyTokenC.approve(await tinyBankC.getAddress(), stakingamount);
      await tinyBankC.stake(stakingamount);
      await tinyBankC.withdraw(stakingamount);
      expect(await tinyBankC.staked(signer0.address)).to.equal(0);
      expect(await MyTokenC.balanceOf(signer0.address)).to.equal(
        MINTING_AMOUNT * 10n ** DECIMALS
      );
      //mingamont확인
    });
  });
});
