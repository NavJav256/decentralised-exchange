const { expect } = require('chai')
const { ethers } = require('hardhat')

const convertToEther = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token contract', () => {

    let token

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Nav Token', 'NAVT', 1000000)
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
    })

})
