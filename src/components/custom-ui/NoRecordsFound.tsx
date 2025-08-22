const NoRecordsFound = ({ text }) => {
  return (
    <div className="flex items-center font-light justify-center w-full max-w-40 sm:max-w-full mt-10 mb-6">
      <span className="text-center h-10 text-muted-foreground w-full">
        {text}
      </span>
    </div>
  );
};

export default NoRecordsFound;
