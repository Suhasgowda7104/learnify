export default (sequelize, DataTypes) => {
    const Role = sequelize.define("Role", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                isIn: {
                    args: [['admin', 'student']],
                    msg: "Role name must be either 'admin' or 'student'"
                }
            }
        }
    }, {
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Role.associate = (models) => {
        Role.hasMany(models.User, {
            foreignKey: "roleId",
            as: "users",
            onDelete: "RESTRICT"
        });
    };

    return Role;
};