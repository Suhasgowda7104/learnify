export default (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Email address must be valid"
                }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'last_name'
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'role_id',
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    User.associate = (models) => {
        User.belongsTo(models.Role, {
            foreignKey: "roleId",
            as: "role",
            onDelete: "RESTRICT"
        });

        User.hasMany(models.Enrollment, {
            foreignKey: "studentId",
            as: "enrollments",
            onDelete: "CASCADE"
        });
    };

    return User;
};