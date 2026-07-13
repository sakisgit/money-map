const SearchInput = ({
  id,
  value,
  onChange,
  onFocus,
  placeholder,
  clearLabel = "Clear search",
}) => (
  <div className="input-group search-input">
    <span className="input-group-text bg-light border-end-0">
      <i className="fa-solid fa-magnifying-glass" aria-hidden></i>
    </span>
    <input
      type="text"
      id={id}
      className="form-control border-start-0 search-input__field"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
    />
    {value && (
      <button
        type="button"
        className="search-input__clear"
        onClick={() => onChange("")}
        aria-label={clearLabel}
      >
        <i className="fa-solid fa-xmark" aria-hidden></i>
      </button>
    )}
  </div>
);

export default SearchInput;
