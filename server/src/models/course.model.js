export default (sequelize, DataTypes) => {
    const Course = sequelize.define("Course", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: {
                    args: [0],
                    msg: "Price must be a positive number"
                }
            }
        },
        durationHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'duration_hours',
            validate: {
                min: {
                    args: [1],
                    msg: "Duration must be at least 1 hour"
                }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'courses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Course.associate = (models) => {
        Course.hasMany(models.CourseContent, {
            foreignKey: "courseId",
            as: "contents",
            onDelete: "CASCADE"
        });

        Course.hasMany(models.Enrollment, {
            foreignKey: "courseId",
            as: "enrollments",
            onDelete: "CASCADE"
        });
    };

    return Course;
};