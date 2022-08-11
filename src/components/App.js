import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import config from '../config.json'

import { 
  loadNetwork,
  loadProvider, 
  loadAccount,
  loadTokens,
  loadExchange 
} from '../store/interactions'

const App = () => {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    await loadAccount(provider, dispatch)

    const navT = config[chainId].navT
    const mETH = config[chainId].mETH
    // const mDAI = config[chainId].mDAI
    await loadTokens(provider, [navT.address, mETH.address], dispatch)

    const ex = config[chainId].exchange
    await loadExchange(provider, ex.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  )
}

export default App;
