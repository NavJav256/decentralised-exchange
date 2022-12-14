const { expect } = require('chai')
const { ethers } = require('hardhat')

const convertToEther = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token contract', () => {

    let token, accounts, deployer, receiver, exchange

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Nav Token', 'NAVT', 1000000)
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
    })

    describe('Deployment', () => {
        const name = 'Nav Token'
        const symbol = 'NAVT'
        const decimals = '18'
        const totalSupply = convertToEther(1000000)

        it('Has correct name', async () => {
            expect(await token.name()).to.equal(name)
        })
    
        it('Has correct symbol', async () => {
            expect(await token.symbol()).to.equal(symbol)
        })
    
        it('Has correct decimals', async () => {
            expect(await token.decimals()).to.equal(decimals)
        })
    
        it('Has correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('Assigns total supply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })

    describe('Sending Tokens', () => {

        let amount, transaction, result

        describe('Success', () => {

            beforeEach(async () => {
                amount = convertToEther(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
            })
    
            it('Transfers token balances', async() => {
                expect(await token.balanceOf(deployer.address)).to.equal(convertToEther(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })
    
            it('Emits a Transfer event', async() => {
                const events = result.events[0]
                expect(events.event).to.equal('Transfer')
    
                const args = events.args
                expect(args._from).to.equal(deployer.address)
                expect(args._to).to.equal(receiver.address)
                expect(args._value).to.equal(amount)
            })

        })

        describe('Failure', () => {

            it('Rejects insufficient balances', async () => {
                const invalidAmount = convertToEther(100000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
            })

        })

    })

    describe('Approving Tokens', () => {

        let amount, transaction, result

        beforeEach(async () => {
            amount = convertToEther(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })

        it('allocates an allowance for spending tokens', async () => {
            expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
        })

        it('Emits an Approval event', async() => {
            const events = result.events[0]
            expect(events.event).to.equal('Approval')

            const args = events.args
            expect(args._owner).to.equal(deployer.address)
            expect(args._spender).to.equal(exchange.address)
            expect(args._value).to.equal(amount)
        })

    })

    describe('Delegated Token Transfer', () => {

        let amount, transaction, result

        beforeEach(async () => {
            amount = convertToEther(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })

        describe('Success', () => {

            beforeEach(async () => {
                transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
                result = await transaction.wait()
            })

            it('Transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(convertToEther(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })

            it('Resets the allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(0)
            })

            it('Emits a Transfer event', async() => {
                const events = result.events[0]
                expect(events.event).to.equal('Transfer')
    
                const args = events.args
                expect(args._from).to.equal(deployer.address)
                expect(args._to).to.equal(receiver.address)
                expect(args._value).to.equal(amount)
            })

        })

        describe('Failure', () => {
            
            it('Rejects insufficient amounts', async () => {
                const invalidAmount = convertToEther(100000000)
		        await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
            })

        })

    })

})
