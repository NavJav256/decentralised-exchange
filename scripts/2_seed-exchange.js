const config = require('../src/config.json')

const convertToEther = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {

    //Get all accounts
    const accounts = await ethers.getSigners()

    const { chainId }  = await ethers.provider.getNetwork()
    console.log('Using chainId:', chainId)

    //Initialise tokens
    const navT = await ethers.getContractAt('Token', config[chainId].navT.address)
    console.log(`navT Token fetched: ${navT.address}\n`)
    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`mETH Token fetched: ${mETH.address}\n`)
    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`mDAI Token fetched: ${mDAI.address}\n`)

    //Initialise exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched: ${exchange.address}\n`)

    //Give tokens to account 1
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = convertToEther(10000)

    let transaction, result

    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

    //Set up exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]

    //User 1 approves 10,000 nav tokens
    transaction = await navT.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}`)

    //User 1 deposits 10,000 nav tokens
    transaction = await exchange.connect(user1).depositToken(navT.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

    //User 2 approves 10,000 mETH tokens
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}`)

    //User 2 deposits 10,000 mETH tokens
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

    //User 1 makes an order
    let orderID
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToEther(100), navT.address, convertToEther(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //User 1 cancels the order
    orderID = result.events[0].args._id
    transaction = await exchange.connect(user1).cancelOrder(orderID)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`)

    //Wait 1 second
    await wait(1)

    //User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToEther(100), navT.address, convertToEther(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //User 2 fills the order
    orderID = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderID)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    //Wait 1 second
    await wait(1)

    //User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToEther(50), navT.address, convertToEther(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //User 2 fills the order
    orderID = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderID)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    //Wait 1 second
    await wait(1)

    //User 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToEther(200), navT.address, convertToEther(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //User 2 fills the order
    orderID = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderID)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    //Wait 1 second
    await wait(1)

    //User 1 makes 10 random orders
    for(let i=1; i<=10; i++) {
        // var randNumOne = Math.floor(Math.random() * 10) + 1 
        // var randNumTwo = Math.floor(Math.random() * 10) + 1
        // transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToEther(randNumOne * i), navT.address, convertToEther(Math.floor(randNumTwo * i / 2)))
        transaction = await exchange.connect(user1).makeOrder(mETH.address, convertToEther(10*i), navT.address, convertToEther(10))
        console.log(`Made order from ${user1.address}`)
        await wait(5)
    }

    //User 2 makes 10 random orders
    for(let i=1; i<=10; i++) {
        // var randNumOne = Math.floor(Math.random() * 10) + 1 
        // var randNumTwo = Math.floor(Math.random() * 10) + 1
        // transaction = await exchange.connect(user2).makeOrder(navT.address, convertToEther(Math.floor(randNumOne * i / 2)), mETH.address, convertToEther(randNumTwo * i))
        transaction = await exchange.connect(user2).makeOrder(navT.address, convertToEther(10), mETH.address, convertToEther(10*i))
        console.log(`Made order from ${user2.address}`)
        await wait(5)
    }

}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })