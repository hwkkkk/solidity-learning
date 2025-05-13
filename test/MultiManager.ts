import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MultiManagedAccess } from "../typechain-types";
import { sign } from "crypto";


describe("TinyBank", () => {
    let MyTokenC: MyToken;
    let tinyBankC: TinyBank;
    let signers: HardhatEthersSigner[];
  
    beforeEach(async () => {
      signers = await hre.ethers.getSigners();
      //manager 3명 초기화
      const managers = [signers[1].address, signers[2].address, signers[3].address];
  
      MyTokenC = await hre.ethers.deployContract("MyToken", [
        "MyToken",
        "MT",
        DECIMALS,
        MINTING_AMOUNT,
      ]);
      tinyBankC = await hre.ethers.deployContract("TinyBank", [
        await MyTokenC.getAddress(), managers,
      ]);
      await MyTokenC.setManager(tinyBankC.getAddress());
  
  
  
    });
    describe("multimanged access test", () => {
        it("should have correct manager addresses", async () => {
            //typescript는 상속받은거를 인식을 안해준다는데 이해가 안되는데 일단 쓰겠습니다
            const access = tinyBankC as any;
            for (let i = 0; i < 3; i++) {
              const contractManager = await access.managers(i);
              expect(contractManager).to.equal(signers[i + 1].address);
            }
          });
          
          it("only managers can confirm", async () => {
            const access = tinyBankC as any;
          
            await expect(access.connect(signers[4]).confirm()).to.be.revertedWith("You are not one of the managers");
            await expect(access.connect(signers[1]).confirm()).not.to.be.reverted;
          });

          it("should confirm all manager", async () => {
            const access = tinyBankC as any;
            const hack = signers[0];
            const stakingamount = hre.ethers.parseUnits("50", DECIMALS);
            await MyTokenC.approve(await tinyBankC.getAddress(), stakingamount);
            await tinyBankC.stake(stakingamount);
            const rewardToChange = hre.ethers.parseUnits("10", DECIMALS);
      
            await expect(
              tinyBankC.connect(hack).setRewardPerBlock(rewardToChange)
            ).to.be.revertedWith("Not all managers confirmed yet");
            
            await expect(access.connect(signers[1]).confirm()).not.to.be.reverted;
            await expect(access.connect(signers[2]).confirm()).not.to.be.reverted;
            await expect(access.connect(signers[3]).confirm()).not.to.be.reverted;
            
            await expect(
                tinyBankC.connect(hack).setRewardPerBlock(rewardToChange)
              ).not.to.be.reverted
            

            //reset 됬기 때문에 통과 안됨
            await expect(
                tinyBankC.connect(signers[0]).setRewardPerBlock(rewardToChange)
            ).to.be.revertedWith("Not all managers confirmed yet");
    
          });
             
    });

});