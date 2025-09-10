export default (sequelize, DataTypes) => {
    const Enrollment = sequelize.define("Enrollment", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'student_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'course_id',
            references: {
                model: 'courses',
                key: 'id'
            }
        },
        enrollmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'enrollment_date'
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'enrolled',
            validate: {
                isIn: {
                    args: [['enrolled', 'completed']],
                    msg: "Status must be either 'enrolled' or 'completed'"
                }
            }
        },
        completionDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completion_date'
        }
    }, {
        tableName: 'enrollments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['student_id', 'course_id']
            }
        ]
    });

    Enrollment.associate = (models) => {
        Enrollment.belongsTo(models.User, {
            foreignKey: "studentId",
            as: "student",
            onDelete: "CASCADE"
        });

        Enrollment.belongsTo(models.Course, {
            foreignKey: "courseId",
            as: "course",
            onDelete: "CASCADE"
        });
    };

    return Enrollment;
};