# jpa

## 表关联

User 表和 Role表建立多对多关系。

```java
@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Table(indexes = { @Index(name = "user_name_unique", columnList = "name", unique = true) })
public class User extends BaseEntity {

	private static final long serialVersionUID = 1L;

	private String name;

	private String nick;

	/**
	 * 角色
	 */
	@ManyToMany(fetch = FetchType.EAGER )
	@JoinTable(name="link_user_role",
			joinColumns={ @JoinColumn(name="user_id",referencedColumnName="id")},
			inverseJoinColumns={@JoinColumn(name="role_id",referencedColumnName="id")})
	private List<Role> roles;
}
```

Role:

```java
@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Role extends BaseEntity {

    /**
     * 角色名称
     */
    private String name;

    /**
     *  角色类型
     */
    private int type;
}
```

会自动创建表 `LINK_USER_ROLE` , 里面2个字段，为 `user_id` 和 `role_id`

`ManyToMany` 如果不带 `fetch = FetchType.EAGER`，报以下错误：
>failed to lazily initialize a collection of role: cn.xiaowenjie.common.rbac.User.roles, could not initialize proxy - no Session

