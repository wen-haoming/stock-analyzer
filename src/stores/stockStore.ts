import { create } from 'zustand'

interface Stock {
  symbol: string
  name: string
  market: 'HK' | 'CN' | 'US'
}

interface StockStore {
  // 状态
  stocks: Stock[]
  selectedStock: Stock | null
  market: 'HK' | 'CN' | 'US'
  klineData: any[]
  klineType: '101' | '102' | '103'
  loading: boolean
  
  // Actions
  setStocks: (stocks: Stock[]) => void
  selectStock: (stock: Stock | null) => void
  setMarket: (market: 'HK' | 'CN' | 'US') => void
  setKlineData: (data: any[]) => void
  setKlineType: (type: '101' | '102' | '103') => void
  setLoading: (loading: boolean) => void
}

export const useStockStore = create<StockStore>((set) => ({
  stocks: [],
  selectedStock: null,
  market: 'HK',
  klineData: [],
  klineType: '101',
  loading: false,
  
  setStocks: (stocks) => set({ stocks }),
  selectStock: (stock) => set({ selectedStock: stock }),
  setMarket: (market) => set({ market }),
  setKlineData: (data) => set({ klineData: data }),
  setKlineType: (type) => set({ klineType: type }),
  setLoading: (loading) => set({ loading }),
}))
