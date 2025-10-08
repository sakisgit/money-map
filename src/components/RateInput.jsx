

const RateInput = () => {
  return (
    <div className="col-md-6">
        <div className="card shadow-sm border-0 rounded-3 p-4 text-center">
            <h6 className="mb-3 text-muted fw-bold">Hourly Rate (€)</h6>
            <div className="d-flex justify-content-center gap-2">
                <input 
                    type="number" 
                    className="form-control text-center"
                    placeholder="€/hour"
                    style={{ width: '120px', height: '38px' }}
                />
                <button  
                    className="btn btn-success fw-bold px-3 py-1"
                >
                    Add
                </button>
            </div>
        </div>
    </div>
  )
}

export default RateInput