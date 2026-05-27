
export function createDataState(dataType = 'array') {
    if(dataType === 'array') {
        return {
          data: [],
          sort:"",
          page: 1,
          limit: 10,
          total: 0,
          totalPage: 0,
          loading: false,
          errorMessage: "",
        };
    } else {
        return {
            data: null,
            loading: false,
            errorMessage: '',
        }
    }
}

export function setPending(state,  key) {
  state[key].loading = true
  state[key].errorMessage = ''
}

export function setRejected(state, action, key) {
  state[key].loading = false
  state[key].errorMessage = action.payload
}

export function setFulfilled(state, action, key) {
  const obj = state[key]

  obj.data = action.payload.data.rows
  obj.total = action.payload.data.total_rows
  obj.totalPage = action.payload.data.total_pages
  obj.page = action.payload.data.page
  obj.limit = action.payload.data.limit
  obj.sort = action.payload.data.sort

  obj.loading = false
}
