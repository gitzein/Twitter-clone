const LoadingSpinner = ({ size = "md", color }) => {
  const sizeClass = `loading-${size}`;

  return (
    <span
      className={
        `loading loading-spinner ${sizeClass} ` + (color && `text-${color}`)
      }
    />
  );
};
export default LoadingSpinner;
