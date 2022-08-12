import { ethers } from "ethers"
 
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({type: 'PROVIDER_LOADED', connection})
    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch({type: 'NETWORK_LOADED', chainId})
    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({type: 'ACCOUNT_LOADED', account})

    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({type: 'ETHER_BALANCE_LOADED', balance}) 

    return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol

    token = new ethers.Contract(addresses[0] , TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({type: 'TOKEN_LOADED_1', token, symbol})
    token = new ethers.Contract(addresses[1] , TOKEN_ABI, provider)
    symbol = await token.symbol()
    dispatch({type: 'TOKEN_LOADED_2', token, symbol})
    return symbol
}

export const loadExchange = async(provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({type: 'EXCHANGE_LOADED', exchange})
    return exchange
}

export const subscribeToEvents = (exchange , dispatch) => {
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event})
    })

    exchange.on('Withdraw ', (token, user, amount, balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event})
    })

    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args
        console.log(order)
        dispatch({type: 'NEW_ORDER_SUCCESS', order, event})
    })
}

export const loadBalances = async(exchange, tokens, account, dispatch) => {
    let balance = ethers.utils.formatEther(await tokens[0].balanceOf(account))
    dispatch({type: 'TOKEN_BALANCE_LOADED_1', balance})

    balance = ethers.utils.formatEther(await exchange.balanceOf(tokens[0].address, account))
    dispatch({type: 'EXCHANGE_TOKEN_BALANCE_LOADED_1', balance})

    balance = ethers.utils.formatEther(await tokens[1].balanceOf(account))
    dispatch({type: 'TOKEN_BALANCE_LOADED_2', balance})

    balance = ethers.utils.formatEther(await exchange.balanceOf(tokens[1].address, account))
    dispatch({type: 'EXCHANGE_TOKEN_BALANCE_LOADED_2', balance})
 }

export const transferTokens = async(provider, exchange, transferType, token, amount, dispatch) => {
    let transaction

    dispatch({type: 'TRANSFER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const amountToTransfer = ethers.utils.parseEther(amount)
    
        if(transferType === 'Deposit') {
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
            await transaction.wait()
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
        } else transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
        await transaction.wait()

    } catch (error) {
        dispatch({type: 'TRANSFER_FAIL'})
    }
 }

export const makeBuyOrder = async(provider, exchange, tokens, order, dispatch) => {
    const tokenGet = tokens[0].address
    const amountGet = ethers.utils.parseEther((order.amount).toString())
    const tokenGive = tokens[1].address
    const amountGive = ethers.utils.parseEther((order.amount * order.price).toString())

    dispatch({type: 'NEW_ORDER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    } catch (error) {
        dispatch({type: 'NEW_ORDER_FAIL '})
    }
}

export const makeSellOrder = async(provider, exchange, tokens, order, dispatch) => {
    const tokenGet = tokens[1].address
    const amountGet = ethers.utils.parseEther((order.amount * order.price).toString())
    const tokenGive = tokens[0].address
    const amountGive = ethers.utils.parseEther((order.amount).toString())

    dispatch({type: 'NEW_ORDER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    } catch (error) {
        dispatch({type: 'NEW_ORDER_FAIL '})
    }
}