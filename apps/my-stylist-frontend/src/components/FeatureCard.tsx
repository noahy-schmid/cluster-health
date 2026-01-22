import React from "react";

interface FeatureCardProps {
  icon: string;
  header: string;
  content: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, header, content }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-transform transform hover:-translate-y-2 hover:shadow-lg">
      <div className="text-4xl mb-4 text-primary">
        <i className={icon}></i>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-primary-dark">{header}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  );
};

export default FeatureCard;
