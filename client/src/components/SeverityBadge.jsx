const SeverityBadge = ({ severity }) => {
  const classes = {
    Low: 'badge badge-low',
    Medium: 'badge badge-medium',
    High: 'badge badge-high',
  };

  const icons = {
    Low: '🟢',
    Medium: '🟠',
    High: '🔴',
  };

  return (
    <span className={classes[severity] || 'badge'}>
      {icons[severity]} {severity}
    </span>
  );
};

export default SeverityBadge;
