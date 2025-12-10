interface FlagIconProps {
  country: string;
  className?: string;
}

const FlagIcon = ({ country, className = "w-6 h-4" }: FlagIconProps) => {
  // Map country names to ISO country codes
  const countryCodeMap: { [key: string]: string } = {
    India: "in",
    USA: "us",
    UK: "gb",
    Singapore: "sg",
    Canada: "ca",
    Australia: "au",
  };

  const countryCode = countryCodeMap[country] || "un";

  return (
    <img
      src={`https://flagcdn.com/w20/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w40/${countryCode}.png 2x`}
      alt={`${country} flag`}
      className={`inline-block object-cover ${className}`}
      loading="lazy"
    />
  );
};

export default FlagIcon;
