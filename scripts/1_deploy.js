async function main() {

  console.log('Deploying ...')

  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  const accounts = await ethers.getSigners()
  console.log('Fetching accounts: ')
  accounts.forEach(account => {
    console.log(account.address)
  })

  const navT = await Token.deploy('Nav Token', 'NAVT', 1000000)
  await navT.deployed()
  console.log(`Nav Token deployed to: ${navT.address}`)

  const mETH = await Token.deploy('Mock Eth', 'mETH', 1000000)
  await mETH.deployed()
  console.log(`Mock Eth deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy('Mock Dai', 'mDAI', 1000000)
  await mDAI.deployed()
  console.log(`Mock Dai deployed to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`)


}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
