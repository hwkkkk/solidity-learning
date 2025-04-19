import hre from "hardhat";
import { expect, should } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimals = 18n;

describe("mytoken deploy", () => {
  let MyTokenC: MyToken;
  let signers: HardhatEthersSigner[];
  beforeEach("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    MyTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      18,
      100,
    ]);
  });

  describe("Basic state value check", () => {
    it("should return name", async () => {
      expect(await MyTokenC.name()).equal("MyToken");
    });

    it("should return symbol", async () => {
      expect(await MyTokenC.symbol()).equal("MT");
    });

    it("should return decimals", async () => {
      expect(await MyTokenC.decimals()).equal(decimals);
    });

    it("should return 0 totalSupply", async () => {
      expect(await MyTokenC.totalSupply()).equal(
        mintingAmount * 10n ** decimals
      );
    });
  });

  describe("Mint", () => {
    it("shuld return 1MT balance for signer 0", async () => {
      const signer0 = signers[0];
      expect(await MyTokenC.balanceOf(signers[0].address)).equal(
        100n * 10n ** 18n
      );
    });
  });

  describe("Transfer", () => {
    it("should have 0.5MT", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        MyTokenC.transfer(
          hre.ethers.parseUnits("0.5", decimals),
          signer1.address
        )
      )
        .to.emit(MyTokenC, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.5", decimals)
        );
      expect(await MyTokenC.balanceOf(signer1.address)).equal(
        hre.ethers.parseUnits("0.5", decimals)
      );
    });

    it("shold be reverted with insufficeint balance error", async () => {
      const signer1 = signers[1];
      await expect(
        MyTokenC.transfer(
          hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimals),
          signer1.address
        )
      ).to.be.revertedWith("insufficient balance");
    });
  });

  describe("TransferForm", () => {
    it("should emit Approval event", async () => {
      const signer1 = signers[1];
      await expect(
        MyTokenC.approve(signer1.address, hre.ethers.parseUnits("10", decimals))
      )
        .to.emit(MyTokenC, "Approval")
        .withArgs(signer1.address, hre.ethers.parseUnits("10", decimals));
    });
    it("should be reverted with insufficient allowance error", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        MyTokenC.connect(signer1).transferFrom(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("1", decimals)
        )
      ).to.be.reverted("insufficient allowance");
    });
  });

  describe("approve and transform", () => {
    it("should 0.3mt token from s0 to s1", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        MyTokenC.approve(signer1.address, hre.ethers.parseUnits("10", decimals))
      )
        .to.emit(MyTokenC, "Approval")
        .withArgs(signer1.address, hre.ethers.parseUnits("10", decimals));

      await expect(
        MyTokenC.connect(signer1).transferFrom(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.3", decimals)
        )
      )
        .to.emit(MyTokenC, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.3", decimals)
        );
    

        expect(await MyTokenC.balanceOf(signer1)).equal(
          hre.ethers.parseUnits("0.3", decimals) 
        );

    });
  });
});
