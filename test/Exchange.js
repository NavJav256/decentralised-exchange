const { expect } = require('chai')
const { ethers } = require('hardhat')

const convertToEther = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange contract', () => {

    let exchange, deployer, feeAccount

    const feePercent = 10

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange')
        const Token = await ethers.getContractFactory('Token')

        token1 = await Token.deploy('Nav Token', 'NAVT', 1000000)

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        user1 = accounts[2]

        let transaction = await token1.connect(deployer).transfer(user1.address, convertToEther(100))
        await transaction.wait()

        exchange = await Exchange.deploy(feeAccount.address, feePercent)
    })

    describe('Deployment', () => {

        it('Tracks the fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })
    
        it('Tracks the fee percent', async () => {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
        
    })

    describe('Depositing tokens', () => {

        let transaction, result
        let amount = convertToEther(10)

        
        describe('Success', () => {
            
            beforeEach(async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()
            })

            it('Tracks the token deposit', async () => {
                expect(await token1.balanceOf(exchange.address)).to.be.equal(amount)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(amount)
            })

            it('Emits a Deposit event', async() => {
                const events = result.events[1]
                expect(events.event).to.equal('Deposit')
    
                const args = events.args
                expect(args._token).to.equal(token1.address)
                expect(args._user).to.equal(user1.address)
                expect(args._amount).to.equal(amount)
                expect(args._balance).to.equal(amount)
            })

        })

        describe('Failure', () => {
            
            it('Fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            })

        })

    })

    describe('Withdrawing tokens', () => {

        let transaction, result
        let amount = convertToEther(10)

        
        describe('Success', () => {
            
            beforeEach(async () => {
                //Deposit before withdrawing
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()

                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
                result = await transaction.wait()
            })

            it('Withdraws token funds', async () => {
                expect(await token1.balanceOf(exchange.address)).to.be.equal(0)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(0)
            })

            it('Emits a Withdraw event', async() => {
                const events = result.events[1]
                expect(events.event).to.equal('Withdraw')
    
                const args = events.args
                expect(args._token).to.equal(token1.address)
                expect(args._user).to.equal(user1.address)
                expect(args._amount).to.equal(amount)
                expect(args._balance).to.equal(0)
            })

        })

        describe('Failure', () => {
            
            it('Fails with insufficient balances', async () => {
                await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
            })

        })

    })

})
